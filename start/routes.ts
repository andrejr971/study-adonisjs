import Route from '@ioc:Adonis/Core/Route'

Route.post('/users', 'UsersController.store')
Route.post('/sessions', 'SessionsController.store')
Route.post('/forgot-password', 'ForgotPasswordsController.store')
Route.put('/reset-password', 'ResetPasswordsController.store')

Route.group(() => {
  Route.delete('/logout', 'SessionsController.destroy')
  Route.get('/users', 'UsersController.index')

  Route.post('/files', 'FilesController.store')
  Route.get('/files/:id', 'FilesController.index')

  Route.resource('projects', 'ProjectsController').apiOnly()
  Route.resource('projects.tasks', 'TasksController').apiOnly()
}).middleware('auth')
