import mongoose from "mongoose";

const Schema = mongoose.Schema

const ClubSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'O nome do clube é obrigatório'],
            trim: true,
            minlength: [3, 'O nome precisa ter pelo menos 3 caracteres'],
            maxlength: [100, 'O nome não pode exceder 100 caracteres']
        },
        banner: {
            type: String, 
            required: [true, 'A imagem de banner é obrigatória'],
            match: [/^https?:\/\/.*\.(jpe?g|png|gif|webp)$/i, 'URL de imagem inválida']
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'O administrador do clube é obrigatório']
        },
        members: {
            type: [Schema.Types.ObjectId], 
            ref: 'User',
            validate: {
                validator: function(members) {
                    return members.includes(this.admin);
                },
                message: 'O administrador deve estar na lista de membros'
            },
            default: []
        },
        meets: {
            type: [Schema.Types.ObjectId], 
            ref: 'Meet',
            default: []
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'A descrição não pode exceder 500 caracteres']
        },
        rules: {
            type: [{
                type: String,
                required: [true, 'Cada regra precisa ter um conteúdo'],
                trim: true,
                minlength: [5, 'Cada regra deve ter pelo menos 5 caracteres'],
                maxlength: [200, 'Cada regra não pode exceder 200 caracteres']
            }],
            default: [],
            validate: {
                validator: function(rules) {
                    return rules.length <= 25;
                },
                message: 'O clube não pode ter mais de 25 regras'
            }
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Club", ClubSchema);