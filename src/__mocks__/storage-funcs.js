// Mock the uploadPetProfilePhoto function
const uploadPetProfilePhoto = jest.fn((pet, file) => Promise.resolve(`mocked_url_for_${pet}`));

module.exports = {
  uploadPetProfilePhoto,
};