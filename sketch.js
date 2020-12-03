var dogImage, dog, happyDogImg;
var database;
var foodS, foodStock;
var feedPet, refill;
var feedImage, refillImage;
var fedTime, lastFed;
var foodObj;
var fedtime;
var gameState, readState;
var currentTime;
var mood;
var hungryDog, sleepyDog, playfulDog, bathingDog;
var hungryAgain;

function preload(){
  dogImage = loadAnimation("images/dog.png");
  happyDogImg = loadAnimation("images/happy.png");
  hungryDog = loadAnimation("images/dog.png");
  sleepyDog = loadAnimation("scene/Bedroom.png");
  playfulDog = loadAnimation("scene/Garden.png");
  bathingDog = loadAnimation("scene/Bathroom.png");
}

function setup(){
  createCanvas(1000, 500);
  database = firebase.database();

  dog = createSprite(800,250,50,50);
  dog.addAnimation("normalDog", dogImage);
  dog.addAnimation("happy", happyDogImg);
  dog.addAnimation("hungry", hungryDog);
  dog.addAnimation("sleepy", sleepyDog);
  dog.addAnimation("playful", playfulDog);
  dog.addAnimation("bathing", bathingDog);

  dog.a
  dog.scale = 0.2;

  foodStock = database.ref('Food');
  foodStock.on("value", readStock);

  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  })

  foodObj = new Food();

  feed = createButton("Feed The Dog");
  feed.position(600, 95);
  feed.mousePressed(feedDog);

  refill = createButton("Refill");
  refill.position(750, 95);
  refill.mousePressed(addFood);
 
}

function draw(){
  background(46, 139, 87);
  foodObj.display();

  lastFed = database.ref('FeedTime');
  lastFed.on("value", function(data){
    lastFed = data.val();
  });


  currentTime = hour();
 if(currentTime === (lastFed + 1) || currentTime === lastFed){
    update("Playing");
    foodObj.garden();
    dog.changeAnimation("playful", playfulDog);
  } else if(currentTime === (lastFed + 2)){
    update("Sleeping");
    foodObj.bedroom();
    dog.changeAnimation("sleepy", sleepyDog);
  } else if(currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)){
    update("Bathing");
    foodObj.bathroom();
    dog.changeAnimation("bathing", bathingDog);
  } else{
    update("Hungry");
    mood = "Eat!!"
    dog.changeAnimation("hungry", hungryDog);
  }
  

  console.log(gameState);
  console.log(currentTime);
  console.log(lastFed);


  if(gameState != "Hungry"){
    feed.hide();
    refill.hide();
  } else {
    feed.show();
    refill.show();
  }

  hungryAgain = (currentTime - lastFed);

  fill(255);
  textSize(30);
  textFont('Bradley Hand ITC');
  textStyle(BOLD);

  if(lastFed >= 12){
    text("Last Fed : " + lastFed%12 + " PM", 370, 30);
  } else if (lastFed === 0){
    text("Have You Even Fed Your Dog???", 370, 30);
  } else {
    text("Last Fed : " + lastFed + " AM", 370, 30);
  }

  text("Your Dog Wants To : " + mood, 320, 400);

  if(hungryAgain > 0 && hungryAgain < 6){
  text("Hours Till Dog Goes Hungry Again : " + hungryAgain, 250, 440);
  } else if(hungryAgain === 0){
    text("Hours Till Dog Goes Hungry Again : 5", 250, 440);
  } else {
    text("Your Dog IS Hungry!! Feed Him Now!!", 270, 440);
  }
  console.log(hungryAgain)

  drawSprites();
  
}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}

function feedDog(){
  if(foodS != 0){
  dog.changeAnimation("happy", happyDogImg);
  if(foodS%10 === 0){
     dog.x -= 190; 
   } 
    if(dog.x != 800){
      for(var i = 9; i >= 0; i--){
        if(foodS%i === 0){
          dog.x -= 15;
        }
      }
}
  }
  foodObj.deductFood();
  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime : hour()
  })
  
  //console.log(lastFed);
}


function addFood(){
  if(foodS < 10 && foodS != 0){
    foodS++;
  } else if(foodS === 10){
    alert("How much will one dog drink?")
  } else if(foodS === 0){
    foodS = 10;
  } else {
    foodS = foodS;
  }
  dog.x = 800;
  dog.y = 250;
  
  database.ref('/').update({
    Food : foodS
  })
}

function update(state){
  database.ref('/').update({
    gameState:state
  })
}