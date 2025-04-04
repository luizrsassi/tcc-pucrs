import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  text: {
    type: String,
    required: [true, 'Mensagem não pode estar vazia'],
    maxlength: [1000, 'Mensagem muito longa (máx. 1000 caracteres)']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const meetSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'O clube é obrigatório']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'O livro é obrigatório'],
    validate: {
      validator: async function(value) {
        const book = await mongoose.model('Book').findById(value);
        return !!book;
      },
      message: 'Livro não encontrado'
    }
  },
  title: {
    type: String,
    required: [true, 'O título do encontro é obrigatório'],
    maxlength: [100, 'O título não pode ter mais que 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'A descrição é obrigatória'],
    maxlength: [1000, 'A descrição não pode ter mais que 1000 caracteres']
  },
  datetime: {
    type: Date,
    required: [true, 'A data e hora são obrigatórias'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'A data do encontro deve ser futura'
    }
  },
  location: {
    type: String,
    required: [true, 'A localização é obrigatória'],
    default: 'Online',
    maxlength: [200, 'Localização muito longa (máx. 200 caracteres)']
  },
  status: {
    type: String,
    enum: ['agendado', 'cancelado', 'realizado', 'adiado'],
    default: 'agendado'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discussions: [messageSchema],
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

meetSchema.index({ clubId: 1, 'discussions.timestamp': -1 });
meetSchema.index({ book: 1 });

// Virtual para participantes (todos os membros do clube)
// meetSchema.virtual('participants', {
//   ref: 'Club',
//   localField: 'clubId',
//   foreignField: '_id',
//   justOne: true,
//   get: function(club) {
//     return club?.members || [];
//   }
// });

meetSchema.pre('save', async function(next) {
  try {
  const club = await mongoose.model('Club').findById(this.clubId);
  
  if (!club) {
    throw new Error('Clube não encontrado');
  }

  if (club.admin.toString() !== this.createdBy.toString()) {
    throw new Error('Apenas administradores podem criar encontros');
  }

  next();
} catch (error) {
  console.error('Erro no pre-save hook:', error);
  next(error);
}
});

const Meet = mongoose.model('Meet', meetSchema);
const Message = mongoose.model('Message', messageSchema);

export default Meet;