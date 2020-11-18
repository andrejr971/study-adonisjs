import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'

export default class ProjectsController {
  public async index({ request }: HttpContextContract) {
    const { page } = request.get()
    const projects = await Project.query()
      .preload('user')
      .paginate(page || 1)

    return projects
  }

  public async store({ request, auth }: HttpContextContract) {
    const data = request.only(['title', 'description'])

    const schemaValidator = schema.create({
      title: schema.string({}, [rules.required()]),
      description: schema.string(),
    })

    await validator.validate({
      schema: schemaValidator,
      data,
      messages: {
        'title.required': 'Title is required',
      },
    })

    const project = await Project.create({ ...data, userId: auth.user?.id })

    return project
  }

  public async show({ params }: HttpContextContract) {
    const project = await Project.findOrFail(params.id)

    await project.preload('user')
    await project.preload('tasks')

    return project
  }

  public async update({ params, request }: HttpContextContract) {
    const project = await Project.findOrFail(params.id)
    const data = request.only(['title', 'description'])

    project.merge(data)

    await project.save()

    return project
  }

  public async destroy({ params }: HttpContextContract) {
    const project = await Project.findOrFail(params.id)

    await project.delete()
  }
}
