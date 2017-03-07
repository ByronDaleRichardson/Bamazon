// Dependencies
var prompt = require("prompt");
var inquirer = require("inquirer");
var mysql = require("mysql");
var colors = require("colors");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "1choraliers2",
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

function showInventory() {
    connection.query('SELECT * FROM products', function(err, inventory) {
        if (err) throw err;
            console.log("Bamazon's Inventory");
            for (var i = 0; i < inventory.length; i++) {
                console.log("Item ID: " + inventory[i].item_id + " | Product: " + inventory[i].product_name + " | Department: " + inventory[i].department_name + " | Price: " + inventory[i].price + " | Quantity: " + inventory[i].stock_quantity);
            }

            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the ID of the item you would like to buy?",
                    name: "id"
                },
                {
                    type: "input",
                    message: "How many would you like to buy?",
                    name: "quantity"
                }    
                ]).then(function (order) {
                    var quantity = order.quantity;
                    var itemId = order.id;
                    connection.query('SELECT * FROM products WHERE item_id=' + itemId, function(err, selectedItem) {
                        if (err) throw err;
                            if (selectedItem[0].stock_quantity - quantity >= 0) {
                                console.log("Bamazon's Inventory has enough of that item (".green + selectedItem[0].product_name.green + ")!".green);
                                console.log("Quantity in Stock: ".green + selectedItem[0].stock_quantity + " Order Quantity: ".green + quantity);
                                console.log("You will be charged ".green + (order.quantity * selectedItem[0].price) + " dollars. Thank you for shopping @ BAMazon.".green);

                                connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [selectedItem[0].stock_quantity - quantity, itemId],
                                    function(err, inventory) {
                                        if (err) throw err;
                                        showInventory();
                                    });
                            }
                            else {
                                console.log("Insufficient quantity. Please order less of that item, as BAMazon only has ".red + selectedItem[0].stock_quantity + " " + selectedItem[0].product_name.red + " in stock at this moment.".red);
                                showInventory();
                            }

                    });
                });

    });
}

showInventory();