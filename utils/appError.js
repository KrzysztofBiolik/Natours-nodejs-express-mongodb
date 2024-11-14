// Error to wbudowana klasa, która akcetuje tylko parametr messGE
// kiedy rozszerzamy klasę rodzica musimy wezwać super(),
// by wezwać constructor rodzica
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fails' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
