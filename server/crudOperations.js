class CrudOperations {
    constructor(model) {
        this.model = model;
    }

    // GET all
    getAll = async (req, res) => {
        try {
            const items = await this.model.find();
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // GET by ID
    getById = async (req, res) => {
        try {
            const item = await this.model.findById(req.params.id);
            res.json(item);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // POST create
    create = async (req, res) => {
        try {
            console.log('recived')
            const newItem = new this.model(req.body);
            const saved = await newItem.save();
            res.json(saved);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };

    // PUT update
    update = async (req, res) => {
        try {
            const updated = await this.model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            res.json(updated);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };

    // DELETE
    delete = async (req, res) => {
        try {
            await this.model.findByIdAndDelete(req.params.id);
            res.json({ message: "Deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
}

module.exports = CrudOperations;