import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserToken from 'App/Models/UserToken'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'

export default class ForgotPasswordsController {
  public async store({ request, response }: HttpContextContract) {
    try {
      const email = request.input('email')

      const schemaValidator = schema.create({
        email: schema.string({}, [rules.email(), rules.required()]),
      })

      await validator.validate({
        schema: schemaValidator,
        data: {
          email,
        },
        messages: {
          'email.required': 'Email is required',
        },
      })

      const user = await User.findByOrFail('email', email)

      const token = await Hash.make(email)

      await UserToken.create({
        token,
        userId: user.id,
      })

      await Mail.send((message) => {
        message
          .from('teste@teste.com')
          .to(email)
          .subject('Recuperação de senha')
          .htmlView('emails/forgot_password', { email, link: request.input('redirect_url'), token })
      })
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'User not found',
        },
      })
    }
  }
}
