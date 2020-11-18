import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
  public async index() {
    const users = await User.query().preload('addresses')

    return users
  }

  public async store({ request }: HttpContextContract) {
    const userSchema = schema.create({
      name: schema.string({}, [rules.required()]),
      email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
      password: schema.string({}, [rules.required()]),
    })

    const data = request.only(['name', 'email', 'password'])
    const address = request.input('address')

    await validator.validate({
      schema: userSchema,
      data,
      messages: {
        'name.required': 'Name is required to sign up',
        'email.unique': 'The email is already in use',
        'password.required': 'Password is required to sign up',
      },
    })

    const trx = await Database.transaction()

    const user = await User.create(data)

    user.useTransaction(trx)

    await user.related('addresses').createMany([address])

    return user
  }
}
