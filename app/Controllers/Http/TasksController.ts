import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
  public async index({ params }: HttpContextContract) {
    const tasks = await Task.query()
      .where('project_id', params.project_id)
      .preload('user')
      .preload('file')

    return tasks
  }

  public async store({ request, params }: HttpContextContract) {
    const data = request.only(['user_id', 'title', 'description', 'due_date', 'file_id'])

    const schemaValidator = schema.create({
      title: schema.string({}, [rules.required()]),
    })

    await validator.validate({
      schema: schemaValidator,
      data,
      messages: {
        'title.required': 'Title is required',
      },
    })

    const task = await Task.create({ ...data, projectId: params.project_id })

    return task
  }

  public async show({ params }: HttpContextContract) {
    const task = await Task.findOrFail(params.id)

    await task.preload('user')
    await task.preload('file')

    return task
  }

  public async update({ request, params }: HttpContextContract) {
    const data = request.only(['user_id', 'title', 'description', 'due_date', 'file_id'])
    const task = await Task.findOrFail(params.id)

    task.merge(data)

    await task.save()

    return task
  }

  public async destroy({ params }: HttpContextContract) {
    const task = await Task.findOrFail(params.id)

    await task.delete()
  }
}
