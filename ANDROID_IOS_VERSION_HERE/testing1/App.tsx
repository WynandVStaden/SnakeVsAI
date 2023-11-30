import "react-native-gesture-handler";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Button } from 'react-native';

const { width, height } = Dimensions.get('window');
const CELL_SIZE = 40;
const cells_hor = Math.floor(Dimensions.get('window').width / CELL_SIZE);
const cells_ver = Math.floor(Dimensions.get('window').height / CELL_SIZE);
let player_len = 0;
let ai_len = 0;
let game_over =false;

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [wall, setWall] = useState([]);
  const [grid, setGrid] = useState([]);


  useEffect(() => {
    const newWall = [];

    // Generating walls on all sides of the grid
    for (let i = 0; i < cells_hor; i++) {
      newWall.push({ x: i, y: 0 });
      newWall.push({ x: i, y: cells_ver - 1});
    }
    for (let j = 0; j < cells_ver; j++) {
      newWall.push({ x: 0, y: j });
      newWall.push({ x: cells_hor -1, y: j });
    }

    setWall(newWall);

    const newGrid = [];
    for (let j = 0; j < cells_ver; j++)
      for (let i = 0; i < cells_hor; i++)
        newGrid.push({ x: i, y: j });

    setGrid(newGrid);

  }, []);

  const [food, setFood] = useState(generateRandomFood());
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [aiSnake, setAiSnake] = useState([{ x: 10, y: 10 }]);
  const [isGameOver, setIsGameOver] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => handlePanResponderMove(gesture),
  });

  useEffect(() => {
    if (isGameOver) {
      setSnake([{ x: 5, y: 5 }]);
      setAiSnake([{x: 7, y: 7}]);
      setFood(generateRandomFood());
      setDirection({ x: 1, y: 0 });
      setIsGameOver(false);
    }
  }, [isGameOver]);

  useEffect(() => {
    const handle = setInterval(moveSnake, 40);
    return () => clearInterval(handle);
  }, [snake]);

  useEffect(() => {
    const aiHandle = setInterval(moveAiSnake, 80);
    return () => clearInterval(aiHandle);
  }, [aiSnake]);

  const handlePanResponderMove = (gesture) => {
    if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
      setDirection({ x: gesture.dx > 0 ? 1 : -1, y: 0 });
    } else {
      setDirection({ x: 0, y: gesture.dy > 0 ? 1 : -1 });
    }
  };

  const moveSnake = () => {

    if (ai_len >= 10 && ai_len > player_len) {
        game_over =true;
        ai_len = 0;
        player_len = 0;
     }

    if (game_over) {
      restartGame();
      game_over = false;
     }

    const newSnake = snake.map((segment) => ({ ...segment }));
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

    if (isCollisionWithWall(head)) {
      if (head.x <= 1) {
        head.x = 1;
      }
      if (head.y <= 1) {
        head.y = 1;
      }
      if (head.x >= cells_hor - 2) {
        head.x = cells_hor - 2;
      }
      if (head.y >= cells_ver - 2) {
        head.y = cells_ver - 2;
      }
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setFood(generateRandomFood());
      player_len++;
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const moveAiSnake = () => {
    if (game_over) {
      return;
    }

    const newAiSnake = aiSnake.map((segment) => ({ ...segment }));
    const aiHead = { x: newAiSnake[0].x, y: newAiSnake[0].y };

    const dx = food.x - aiHead.x;
    const dy = food.y - aiHead.y;

      newAiSnake.unshift(aiHead);
      if (aiHead.x === food.x && aiHead.y === food.y) {
              setFood(generateRandomFood());
              ai_len++;
            } else {
              newAiSnake.pop();
            }
           setAiSnake(newAiSnake);

    // Move towards the food
    if (Math.abs(dx) > Math.abs(dy)) {
      setAiSnake([{ x: aiHead.x + Math.sign(dx), y: aiHead.y }, ...newAiSnake.slice(0, -1)]);
    } else {
      setAiSnake([{ x: aiHead.x, y: aiHead.y + Math.sign(dy) }, ...newAiSnake.slice(0, -1)]);
    }



  };

  const isCollisionWithWall = (head) => (head.x <= 1 || head.x >= cells_hor - 2 || head.y <= 1 || head.y >= cells_ver - 2);

  const restartGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setAiSnake([{x:4, y:4}]);
    setFood(generateRandomFood());
    setDirection({ x: 1, y: 0 });
    game_over = false;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {grid.map((grid, index) => (
        <View key={index} style={[styles.grid, { left: grid.x * CELL_SIZE, top: grid.y * CELL_SIZE }]} />
      ))}
      {snake.map((segment, index) => (
        <View key={index} style={[styles.segment, { left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE }]} />
      ))}
      {wall.map((wall, index) => (
        <View key={index} style={[styles.wall, { left: wall.x * CELL_SIZE, top: wall.y * CELL_SIZE }]} />
      ))}
      {aiSnake.map((segment, index) => (
        <View
          key={`ai-${index}`}
          style={[styles.aiSegment, { left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE }]}
        />
      ))}
      {game_over && <Text style={styles.gameOverText}>Game Over!</Text>}
      <View style={[styles.food, { left: food.x * CELL_SIZE, top: food.y * CELL_SIZE }]} />
    </View>
  );
};

const generateRandomFood = () => ({
  x: Math.floor(Math.random() * (cells_hor-2) + 1),
  y: Math.floor(Math.random() * (cells_ver-2) + 1),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
  segment: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'green',
    borderColor: 'black',
  },
  wall: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'black',
  },
  grid: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: 'gray',
  },
  food: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'red',
  },
  aiSegment: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'purple',
    borderColor: 'black',
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  restartButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SnakeGame;