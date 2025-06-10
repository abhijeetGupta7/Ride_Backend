class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        const response = await this.model.create(data); // This creates and saves in one step
        return response;
    }

    async update(id, data) {
        const response = await this.model.findByIdAndUpdate(id, data, { new: true }); // Returns updated document
        return response;
    }

    async get(id) {
        const response = await this.model.findById(id)// Find document by id
        return response;
    }

    async getAll() { // Fetches all documents
        const response = await this.model.find(); // Use find()
        return response;
    }

    async deleteById(id) {
        const response = await this.model.findByIdAndDelete(id); // Deletes by id
        return response;
    }
}

module.exports = CrudRepository;
