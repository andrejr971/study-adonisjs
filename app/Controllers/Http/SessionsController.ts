import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'

export default class SessionsController {
  public async store({ request, auth, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const sessionSchema = schema.create({
      email: schema.string({}, [rules.email(), rules.required()]),
      password: schema.string({}, [rules.required()]),
    })

    await validator.validate({
      schema: sessionSchema,
      data: {
        email,
        password,
      },
      messages: {
        'email.required': 'Email is required to sign in',
        'password.required': 'Password is required to sign in',
      },
    })

    try {
      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '3 days',
      })

      return {
        user: auth.user,
        token: token.toJSON().token,
      }
    } catch (err) {
      if (err.code === 'E_INVALID_AUTH_UID') {
        return response.status(401).send({
          error: {
            message: 'E-mail or password incorret',
          },
        })
      }

      if (err.code === 'E_INVALID_AUTH_PASSWORD') {
        return response.status(401).send({
          error: {
            message: 'E-mail or password incorret',
          },
        })
      }
    }
  }

  public async destroy({ auth }: HttpContextContract) {
    await auth.use('api').logout()
  }
}
