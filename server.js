const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors")

const app = express();
const jsonParser = bodyParser.json();

const getUsers = () => JSON.parse(fs.readFileSync("users.json", "utf8"))

// Делаем работу с КОРС проще
app.use(cors());

// Отправляем юзеру HTML страницу
app.use(express.static(__dirname + "/public"));

// получение списка данных
app.get("/api/users", (req, res) => {
  const users = getUsers();
  res.send(users);
});

// получение одного пользователя по id
app.get("/api/users/:id", function(req, res) {
  const users = getUsers();
  const id = req.params.id; // получаем id
  
  // находим в массиве пользователя по id
  const user = users.find(currentUser => +id === +currentUser.id);

  // отправляем пользователя
  if (user) {
    res.send(user);
  } else {
    res.status(404).send();
  }

});

// получение отправленных данных
app.post("/api/users", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { name, age } = req.body;
  const user = { name, age };
  const users = getUsers();

  // находим максимальный id
  const id = Math.max.apply(
    null,
    users.map(currentUser => currentUser.id)
  );

  // увеличиваем его на единицу
  user.id = id + 1;

  // добавляем пользователя в массив
  users.push(user);
  const data = JSON.stringify(users);

  // перезаписываем файл с новыми данными
  fs.writeFileSync("users.json", data);
  res.send(user);
});

// удаление пользователя по id
app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const users = getUsers();

  // находим индекс пользователя в массиве
  const index = users.indexOf(currentUser => +currentUser.id === +id);

  
  if (index > -1) {
    // удаляем пользователя из массива по индексу
    const user = users.splice(index, 1)[0];
    const data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);

    // отправляем удаленного пользователя
    res.send(user);
  } else {
    res.status(404).send();
  }
});
// изменение пользователя
app.put("/api/users", jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  const { name, age, id } = req.body;
  const users = getUsers();
  const user = users.find(currentUser => +id === +currentUser.id);

  // изменяем данные у пользователя
  if (user) {
    user.age = age;
    user.name = name;
    const data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    res.send(user);
  } else {
    res.status(404).send(user);
  }
});

app.listen(3000, () => {
  console.log("Сервер ожидает подключения...");
});
