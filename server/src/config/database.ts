import mongoose from 'mongoose';
import { config } from '../../../config';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.uri, config.database.options);

    logger.info(`🍃 MongoDB conectado: ${conn.connection.host}`);

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      logger.error('Error de conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconectado');
    });

  } catch (error) {
    logger.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB desconectado correctamente');
  } catch (error) {
    logger.error('Error desconectando MongoDB:', error);
  }
};