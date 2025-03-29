import jwt from "jsonwebtoken";

const login = async (req, res) => {
    const { email, password } = req.body;

    // Busca usuário com senha (select: false precisa ser sobrescrito)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Cria o token JWT
    const token = jwt.sign(
        { id: user._id }, // Payload
        process.env.JWT_SECRET, // Chave secreta (nunca hardcode!)
        { expiresIn: "1d" } // Expiração
    );

    // Remove a senha da resposta
    user.password = undefined;

    res.status(200).json({ user, token });
};