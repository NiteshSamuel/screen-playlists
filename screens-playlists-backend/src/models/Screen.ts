import mangoose, {Schema, Document} from 'mongoose';

export interface IScreen extends Document {
    name: string;
    isActive: boolean;
    createdAt: Date;
}

const ScreenSchema= new Schema<IScreen>({
    name: {type: String, required: true},
    isActive: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now}
});

// case-insensitive search :create a text index on name
ScreenSchema.index({name:'text'});

export const Screen= mangoose.model<IScreen>('Screen', ScreenSchema);