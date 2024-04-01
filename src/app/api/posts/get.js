import { firestore } from '@/lib/firebase';

export default async function handler(req, res) {
 if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
 }

 const { id } = req.query;

 if (!id) {
    return res.status(400).json({ message: 'Post ID is required' });
 }

 try {
    const postRef = firestore.collection('posts').doc(id);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postSnapshot.data();
    return res.status(200).json(postData);
 } catch (error) {
    console.error('Error fetching post data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
 }
}