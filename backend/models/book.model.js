import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    // cover: {
    //   type: String,
    //   match: [/\.(jpe?g|png|webp)$/i, 'Formato de capa inválido']
    // }
  });
  
  const Book = mongoose.model('Book', bookSchema);

  export default Book;