import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserToken from 'App/Models/UserToken'
import { addHours, isAfter } from 'date-fns'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'

export default class ResetPasswordsController {
  public async store({ request, response }: HttpContextContract) {
    const { token, password } = request.all()

    const schemaValidator = schema.create({
      token: schema.string({}, [rules.required()]),
      password: schema.string({}, [rules.required(), rules.confirmed('password_confirmation')]),
    })

    await validator.validate({
      schema: schemaValidator,
      data: {
        token,
        password,
      },
      messages: {
        'token.required': 'Token is required',
        'password.required': 'Password is required',
        'password.confirmed': 'Password is required confirmation',
      },
    })

    try {
      const confirmToken = await UserToken.findByOrFail('token', token)
      const parsedDateToken = confirmToken.createdAt.toJSDate()

      const addHoursToken = addHours(parsedDateToken, 2)

      if (!isAfter(addHoursToken, parsedDateToken)) {
        return response.status(401).send({
          error: {
            message: 'Token invalidate',
          },
        })
      }

      const user = await User.find(confirmToken.userId)

      if (!user) {
        return response.status(400).send({
          error: {
            message: 'User not found',
          },
        })
      }

      user.password = password

      confirmToken.delete()

      await user.save()
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'Token invalidate',
        },
      })
    }
  }
}
