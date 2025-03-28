import mongoose from "mongoose";

const Schema = mongoose.Schema

const PictureSchema = new Schema({
    name: {type: String, required: true},
    src: {type: String, required: true}
});

export default mongoose.model("Picture", PictureSchema);