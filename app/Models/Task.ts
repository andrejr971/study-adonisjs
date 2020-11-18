import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  afterCreate,
  beforeUpdate,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import File from './File'
import Mail from '@ioc:Adonis/Addons/Mail'
import Application from '@ioc:Adonis/Core/Application'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public projectId: number

  @column()
  public fileId: number

  @column()
  public title: string

  @column()
  public description: string

  @column.dateTime()
  public dueDate: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Project)
  public project: BelongsTo<typeof Project>

  @belongsTo(() => File)
  public file: BelongsTo<typeof File>

  @afterCreate()
  @beforeUpdate()
  public static async sendNewTaskMail(task: Task) {
    if (!task.userId && !task.$dirty.userId) {
      return
    }

    await task.preload('user')
    await task.preload('file')

    await Mail.send((message) => {
      message
        .from(task.user.email)
        .to('teste@teste.com')
        .subject('Nova tarefa atribuida a você')
        .htmlView('emails/task_assigned', {
          name: task.user.name,
          title: task.title,
          hasAttachment: !!task.file,
        })

      if (task.file) {
        message.attach(Application.tmpPath(`uploads/${task.file.file}`), {
          filename: task.file.name,
        })
      }
    })
  }
}
