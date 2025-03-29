import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        name: {
            type: String, 
            required: true
        },
        photo: {
            type: String, 
            required: true
        },
        email: {
            type: String, 
            required: true,
            unique: true,
            match: [/\S+@\S+\.\S+/, "Email inválido."]
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        isAdmin: {
            type: Boolean,
            required: false,
            default: false
        },
        memberClubs: {
            type: [Schema.Types.ObjectId], 
            ref: 'Club',
            default: []
        },
        adminClubs: {
            type: [Schema.Types.ObjectId], 
            ref: 'Club',
            default: []
        }
    },
    {
        timestamps: true,
    }
);

// Middleware para hashing da senha antes de salvar
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12); // Salt rounds = 12
    next();
});

// Método para comparar senhas (usado no login)
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);