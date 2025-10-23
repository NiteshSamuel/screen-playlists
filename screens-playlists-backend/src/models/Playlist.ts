import mangoose, { Document, Schema } from 'mongoose';

export interface IPlaylist extends Document {
    name: string;
    itemURLs: string[];
    createdAt: Date;
}

const PlaylistSchema= new Schema<IPlaylist>({
    name: {type: String, required: true},
    itemURLs: {type: [String], default: []},
    createdAt: {type: Date, default: Date.now}
});

PlaylistSchema.index({name:'text'});
export const Playlist= mangoose.model<IPlaylist>('Playlist', PlaylistSchema);