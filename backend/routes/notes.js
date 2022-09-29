const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const router = express.Router(); 
const { body, validationResult } = require("express-validator");



// ROUTE 1 : Get all the notes using: GET"/api/notes/fetchallnotes" . Login Required
router.get('/fetchallnotes',fetchuser, async (req, res)=>{
    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error occured");
    }
})

// ROUTE 2 : Add a new Note using: POST"/api/notes/addnote" . Login Required
router.post('/addnote',fetchuser,[
    body("title", "enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
],
 async (req, res)=>{

    try {
        
        const {title, description, tag} = req.body;

        //If there are errors, return bad requests and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save()
        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error occured");
    }
 })


 // ROUTE 3 : updating a existing Note using: PUT "/api/notes/updatenote" . Login Required
router.put('/updatenote/:id',fetchuser, async (req, res)=>{
 const {title, description, tag} = req.body;  // destructuring method = we take out title, desc, tag from req.body

 try {
    
     // create a newNote object
     const newNote = {};
     if(title){newNote.title = title};
     if(description){newNote.description = description};
     if(tag){newNote.tag = tag};
     
     
     // Find the note to be updated and update it
     let note = await Note.findById(req.params.id);
     if(!note){return res.status(404).send("Not Found")};
     
     if(note.user.toString() !== req.user.id){
         return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error occured");
    }

 });

    // ROUTE 4 : Deleting  Note using: DELETE "/api/notes/deletenote" . Login Required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {

  try {
      
      // Find the note to be deleted and delete it
      let note = await Note.findById(req.params.id);
      if (!note) {
          return res.status(404).send("Not Found");
        }
        
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success": "Note has been deleted!!", note: note})
      
      
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error occured");
    }
});



module.exports = router
