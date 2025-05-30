const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const newNote = new Note({
      content,
      author: req.user.username, 
    });
    
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ error: `Failed to create note: ${err.message}` });
  }
});

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch notes: ${err.message}` });
  }
});

router.patch('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const currentLikes = note?.likes ?? 0;
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { likes: currentLikes + 1 },
      { new: true }
    );
    
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: `Failed to like note: ${err.message}` });
  }
});

router.patch('/:id/unlike', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const currentLikes = note?.likes ?? 0;
    const newLikes = Math.max(0, currentLikes - 1); 
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { likes: newLikes },
      { new: true }
    );
    
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: `Failed to unlike note: ${err.message}` });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (note.author !== req.user.username) {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }
    
    await Note.findByIdAndDelete(id);
    res.json({ message: `Note with id ${id} successfully deleted` });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete note: ${err.message}` });
  }
});

module.exports = router;
