package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object PostRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Posts")

    fun getPosts(onResult: (List<Post>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Post>()
                snapshot.children.forEach { child ->
                    child.getValue(Post::class.java)?.let { list.add(it) }
                }
                onResult(list.sortedByDescending { it.timestamp })
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun addPost(post: Post, onComplete: (Boolean) -> Unit) {
        val id = database.push().key ?: return
        val newPost = post.copy(id = id, timestamp = System.currentTimeMillis())
        database.child(id).setValue(newPost).addOnCompleteListener {
            onComplete(it.isSuccessful)
        }
    }

    fun deletePost(postId: String, onComplete: (Boolean) -> Unit) {
        database.child(postId).removeValue().addOnCompleteListener {
            onComplete(it.isSuccessful)
        }
    }
}
