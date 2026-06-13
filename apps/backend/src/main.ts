import 'reflect-metadata'
import {ValidationPipe} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import cookieParser from 'cookie-parser'
import {AppModule} from './app.module'

const PORT = Number(process.env.API_PORT ?? 3001)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
  await app.listen(PORT)
  console.log(`API listening on http://localhost:${PORT}/api`)
}

void bootstrap()
