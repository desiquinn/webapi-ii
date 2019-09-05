const express = require('express');
const db = require('../data/db.js');

const router = express.Router();

// GET	/api/posts	Returns an array of all the post objects contained in the database.

router.get('/', (req, res) => {
    db.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The posts information could not be retrieved." })
        })
});


// POST	/api/posts	Creates a post using the information sent inside the request body.

router.post('/', (req, res) => {
    const post = req.body;
    const title = req.body.title;
    const contents = req.body.contents;

    if(!title || !contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    }
    db.insert(post)
        .then((postId)=> {
            db.findById(postId.id)
                .then(post => {
                    res.status(201).json(post)
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "There was an error while saving the post to the database" });
                });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({ error: "There was an error while saving the post to the database" });
        });
});


// GET	/api/posts/:id	Returns the post object with the specified id.

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.findById(id)
        .then((posts) => {
            const [post]= posts;
            if(post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The post information could not be retrieved." });
        });
});


// DELETE	/api/posts/:id	Removes the post with the specified id and returns the deleted post object. You may need to make additional calls to the database in order to satisfy this requirement.

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.remove(id)
        .then(post => {
            if(post > 0){
            res.status(200).end();
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The post could not be removed" })
        });
});

// PUT	/api/posts/:id	Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const contents = req.body.contents;

    if(!title || !contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
    db.update(id, {title, contents})
        .then((updated) => {
            console.log('updated:', updated)
            if(updated) {
                db.findById(id)
                    .then(post => {
                        console.log('id:', id)
                        console.log('post:', post)
                        res.status(200).json(post);                    
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: "The post information could not be modified 2." });
                    });
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            };
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The post information could not be modified 1." });
        });
});

// GET	/api/posts/:id/comments	Returns an array of all the comment objects associated with the post with the specified id.

router.get('/:id/comments', (req, res) => {
    const id = req.params.id;
    db.findPostComments(id)
        .then(comments => {
            if(comments.length > 0) {
                res.status(200).json(comments);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The comments information could not be retrieved." })
        })
});


// POST	/api/posts/:id/comments	Creates a comment for the post with the specified id using information sent inside of the request body.

router.post('/:post_id/comments', (req, res) => {
    const { text } = req.body;
    const { post_id } = req.params;

    if(!text) {
        return res.status(400).json({ errorMessage: "Please provide text for the comment." })
    }
    db.insertComment({text, post_id})
        .then((idObj) => {
            const comment_id = idObj.id
            db.findCommentById(comment_id)
                .then(([comment]) => {
                    if(comment) {
                        res.status(201).json(comment)
                    } else {
                        res.status(404).json({ message: "The post with the specified ID does not exist." })
                    }
                })
                .catch(err => {
                    console.log('post find comment error:', err);
                    res.status(500).json({ error: "There was an error while saving the comment to the database 2" })
                });
        })
        .catch(err => {
            console.log('post insert comment error:', err);
            res.status(500).json({ error: "There was an error while saving the comment to the database" })
        });
})

// When the client makes a POST request to /api/posts/:id/comments:
// If the post with the specified id is not found:
// return HTTP status code 404 (Not Found). in the inside/child catch????
// return the following JSON object: { message: "The post with the specified ID does not exist." }.

module.exports = router;