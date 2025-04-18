const MenuItem = require('../models/MenuItem');

exports.addMenuItem = async (req, res) => {
    const { name, category, price, imageUrl } = req.body;

    const image = req.file
        ? '/uploads/' + req.file.filename
        : (imageUrl && imageUrl.trim() !== '' ? imageUrl.trim() : null);

    const newItem = new MenuItem({
        name,
        category,
        price: parseFloat(price),
        image
    });

    await newItem.save();
    res.redirect('/dashboard');
};
