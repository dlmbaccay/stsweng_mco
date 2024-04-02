import { firestore } from './firebase'

// Export the fetch function
module.exports.fetchData = async () => {
	try {
		// Fetch data from the Firestore database
		const snapshot = await firestore.collection('your_collection').get()

		// Process the fetched data
		const data = snapshot.docs.map((doc) => doc.data())

		return data
	} catch (error) {
		console.error('Error fetching data:', error)
		throw error
	}
}

// Export the function to create a new document in a collection with given data
module.exports.createDocument = async (collection, data) => {
	try {
		// Add the data to the Firestore database
		const docRef = await firestore.collection(collection).add(data)

		// Return the ID of the newly created document
		return docRef.id
	} catch (error) {
		console.error('Error creating document:', error)
		throw error
	}
}

// Export the function to create a new User document in a collection with given data
module.exports.createUserDocument = async (collection, documentId, data) => {
	try {
		// Add the data to the Firestore database
		await firestore.collection(collection).doc(documentId).set(data)

		// Return the ID of the newly created document
		return documentId
	} catch (error) {
		console.error('Error creating user document:', error)
		throw error
	}
}

// Export the function to create a new Post document in a collection with given data
module.exports.createPostDocument = async (collection, documentId, data) => {
	try {
		// Add the data to the Firestore database
		await firestore.collection(collection).doc(documentId).set(data)

		// Return the ID of the newly created document
		return documentId
	} catch (error) {
		console.error('Error creating post document:', error)
		throw error
	}
}

// Export the function to update a document in a collection with given data
module.exports.updateDocument = async (collection, documentId, data) => {
	try {
		// Update the document in the Firestore database
		await firestore.collection(collection).doc(documentId).update(data)

		// Return success message
		return 'Document updated successfully'
	} catch (error) {
		console.error('Error updating document:', error)
		throw error
	}
}

// Export the function to delete a document in a collection
module.exports.deleteDocument = async (collection, documentId) => {
	try {
		// Delete the document from the Firestore database
		await firestore.collection(collection).doc(documentId).delete()

		// Return success message
		return 'Document deleted successfully'
	} catch (error) {
		console.error('Error deleting document:', error)
		throw error
	}
}

// Export the function to get all documents in a collection
module.exports.getAllDocuments = async (collection) => {
	try {
		// Fetch data from the Firestore database
		const snapshot = await firestore.collection(collection).get()

		// Process the fetched data
		const data = snapshot.docs.map((doc) => doc.data())

		return data
	} catch (error) {
		console.error('Error getting all documents:', error)
		throw error
	}
}

// Export the function to get a document by ID from a collection
module.exports.getDocumentById = async (collection, documentId) => {
	try {
		// Fetch data from the Firestore database
		const doc = await firestore.collection(collection).doc(documentId).get()

		// Check if the document exists
		if (!doc.exists) {
			return null
		}

		// Return the document data
		return doc.data()
	} catch (error) {
		console.error('Error getting document by ID:', error)
		throw error
	}
}

// Export the function to fetch documents in a collection with a specific condition
module.exports.getDocumentsWithCondition = async (
	collection,
	conditionField,
	conditionOperator,
	conditionValue,
) => {
	try {
		// Fetch data from the Firestore database with the specified condition
		const snapshot = await firestore
			.collection(collection)
			.where(conditionField, conditionOperator, conditionValue)
			.get()

		// Process the fetched data
		const data = snapshot.docs.map((doc) => doc.data())

		return data
	} catch (error) {
		console.error('Error getting documents with condition:', error)
		throw error
	}
}

// Export the function to get a document that matches a value in a field
module.exports.getDocumentByFieldValue = async (collection, field, value) => {
	try {
		// Fetch data from the Firestore database with the specified field and value
		const snapshot = await firestore.collection(collection).where(field, '==', value).get()

		// Check if any documents match the field and value
		if (snapshot.empty) {
			return null
		}

		// Return the first matching document data
		return snapshot.docs[0].data()
	} catch (error) {
		console.error('Error getting document by field value:', error)
		throw error
	}
}

// Export the function to check for documents with a specific username
module.exports.isUsernameTaken = async (username) => {
	try {
		// Fetch data from the Firestore database
		const snapshot = await firestore.collection('users').where('username', '==', username).get()

		// Check if any documents match the username
		const hasUsername = !snapshot.empty

		return hasUsername
	} catch (error) {
		console.error('Error checking username:', error)
		throw error
	}
}

module.exports.createPetDocument = async (collection, documentId, data) => {
	try {
		// Add the data to the Firestore database
		await firestore.collection(collection).doc(documentId).set(data)
	} catch (error) {
		console.error('Error creating pet document:', error)
		throw error
	}
}

module.exports.createCommentDocument = async (postID, commentID, data) => {
	try {
		// Add the data to the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.set(data)
	} catch (error) {
		console.error('Error creating comment document:', error)
		throw error
	}
}

module.exports.updateCommentDocument = async (postID, commentID, data) => {
	try {
		// Update the document in the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.update(data)
	} catch (error) {
		console.error('Error updating comment document:', error)
		throw error
	}
}

module.exports.deleteCommentDocument = async (postID, commentID) => {
	try {
		// Delete the document from the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.delete()
	} catch (error) {
		console.error('Error deleting comment document:', error)
		throw error
	}
}

module.exports.createReplyDocument = async (postID, commentID, replyID, data) => {
	try {
		// Add the data to the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.collection('replies')
			.doc(replyID)
			.set(data)
	} catch (error) {
		console.error('Error creating reply document:', error)
		throw error
	}
}

module.exports.updateReplyDocument = async (postID, commentID, replyID, data) => {
	try {
		// Update the document in the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.collection('replies')
			.doc(replyID)
			.update(data)
	} catch (error) {
		console.error('Error updating reply document:', error)
		throw error
	}
}

module.exports.deleteReplyDocument = async (postID, commentID, replyID) => {
	try {
		// Delete the document from the Firestore database
		await firestore
			.collection('posts')
			.doc(postID)
			.collection('comments')
			.doc(commentID)
			.collection('replies')
			.doc(replyID)
			.delete()
	} catch (error) {
		console.error('Error deleting reply document:', error)
		throw error
	}
}

module.exports.updateBanStatus = async (userID, status) => {
	try {
		let until = null
		if (status === 'temporary' || status === 'permanent') {
			// Check if the status is "temporary" or "permanent"
			if (status === 'temporary') {
				until = new Date() // Set the until date to the current date
				until.setDate(until.getDate() + 3) // Add 3 days to the current date
			}
		}

		// Update the ban status in the Firestore database
		await firestore
			.collection('users')
			.doc(userID)
			.update({
				ban: {
					status: status,
					until: until,
				},
			})
	} catch (error) {
		console.error('Error updating ban status:', error)
		throw error
	}
}

// Export the function that adds a document to a user document's notification collection with data
module.exports.addNotification = async (userID, data) => {
	try {
		// Add the data to the Firestore database
		const docRef = await firestore
			.collection('users')
			.doc(userID)
			.collection('notifications')
			.add(data)

		// Return the ID of the newly created document
		return docRef.id
	} catch (error) {
		console.error('Error adding notification:', error)
		throw error
	}
}
