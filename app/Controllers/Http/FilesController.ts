import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import File from 'App/Models/File'

export default class FilesController {
  public async index({ params, response }: HttpContextContract) {
    const file = await File.findOrFail(params.id)

    return response.download(Application.tmpPath(`uploads/${file.file}`))
  }

  public async store({ request }: HttpContextContract) {
    const upload = request.file('file', {
      size: '2mb',
    })

    if (!upload) {
      return 'Please upload file'
    }

    if (upload.hasErrors) {
      return upload.errors
    }

    const filename = `${Date.now()}.${upload.subtype}`

    await upload.move(Application.tmpPath('uploads'), {
      name: filename,
    })

    const file = await File.create({
      file: filename,
      name: upload.clientName,
      type: upload.type,
      subtype: upload.subtype,
    })

    return file
  }
}
