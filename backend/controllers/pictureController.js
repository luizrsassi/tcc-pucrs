import Picture from './../models/Picture.js';
import fs from 'fs/promises';

export default {
    create: async (req, res) => {
        try {
            const {name} = req.body;
            const file = req.file;
            const picture = new Picture({
                name,
                src: file.path,
            });

            await picture.save();

            res.json({picture, msg: "Imagem salva com sucesso!"});
        } catch (error) {
            res.status(500).json({message: "Erro ao salvar imagem."})
        }
    },

    findAll: async (req, res) => {
        try {
            const pictures = await Picture.find();

            res.status(200).json(pictures)
            
        } catch (error) {
            res.status(500).json({message: "Erro ao buscar imagens."})
        }
    },

    remove: async(req, res) => {
        try {
            const picture = await Picture.findById(req.params.id);
            if (!picture) {
                return res.status(404).json({message: "Imagem não encontrada."})
            }

            try {
                await fs.access(picture.src);
                await fs.unlink(picture.src);
            } catch (fsError) {
                console.error("Erro no filesystem:", fsError)
            }
            await Picture.deleteOne({_id: req.params.id});

            res.status(200).json({message: "Imagem removida com sucesso!"})
            
        } catch (error) {
            res.status(500).json({message: "Erro ao excluir imagem."})
        }
    }
};

    