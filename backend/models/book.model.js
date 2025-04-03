import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: true
    },
    author: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // cover: {
    //   type: String,
    //   match: [/\.(jpe?g|png|webp)$/i, 'Formato de capa inválido']
    // }
  },
  {
    timestamps: true
  });
  
  const Book = mongoose.model('Book', bookSchema);

  export default Book;