import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'On Hold'],
    default: 'Active',
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
