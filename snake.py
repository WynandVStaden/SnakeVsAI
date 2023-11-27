import pygame
import sys
import random
import math

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 600, 400
GRID_SIZE = 20
FPS = 10

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Snake class
class Snake:
    def __init__(self, color):
        self.length = 1
        self.positions = [((WIDTH // 2), (HEIGHT // 2))]
        self.direction = random.choice([0, 1, 2, 3])  # 0: up, 1: down, 2: left, 3: right
        self.color = color

    def get_head_position(self):
        return self.positions[0]

    def update(self):
        current = self.get_head_position()
        x, y = self.get_head_position()
        if self.direction == 0:
            y -= GRID_SIZE
        elif self.direction == 1:
            y += GRID_SIZE
        elif self.direction == 2:
            x -= GRID_SIZE
        elif self.direction == 3:
            x += GRID_SIZE
        self.positions = [((x % WIDTH), (y % HEIGHT))] + self.positions[:self.length - 1]

    def render(self, surface):
        for p in self.positions:
            pygame.draw.rect(surface, self.color, (p[0], p[1], GRID_SIZE, GRID_SIZE))

    def grow(self):
        self.length += 1

    def collide_with_self(self):
        return len(self.positions) != len(set(self.positions))

    def collide_with_wall(self):
        x, y = self.get_head_position()
        return x < 0 or x >= WIDTH or y < 0 or y >= HEIGHT

# AI-controlled Snake class
class AISnake(Snake):
    def __init__(self, color):
        self.length = 1
        self.positions = [((WIDTH // 2), (HEIGHT // 2))]
        self.direction = random.choice([0, 1, 2, 3])  # 0: up, 1: down, 2: left, 3: right
        self.color = color

    def get_head_position(self):
        return self.positions[0]

    def update(self):
        current = self.get_head_position()
        x, y = self.get_head_position()
        if self.direction == 0:
            y -= GRID_SIZE
        elif self.direction == 1:
            y += GRID_SIZE
        elif self.direction == 2:
            x -= GRID_SIZE
        elif self.direction == 3:
            x += GRID_SIZE
        self.positions = [((x % WIDTH), (y % HEIGHT))] + self.positions[:self.length - 1]

    def render(self, surface):
        for p in self.positions:
            pygame.draw.rect(surface, self.color, (p[0], p[1], GRID_SIZE, GRID_SIZE))

    def grow(self):
        self.length += 1

    def collide_with_self(self):
        return len(self.positions) != len(set(self.positions))

    def collide_with_wall(self):
        x, y = self.get_head_position()
        return x < 0 or x >= WIDTH or y < 0 or y >= HEIGHT

    def updateFood(self, food_position):
        head_x, head_y = self.get_head_position()
        food_x, food_y = food_position

        dx = food_x - head_x
        dy = food_y - head_y

        if abs(dx) > abs(dy):
            if dx > 0:
                self.direction = 3  # move right
            else:
                self.direction = 2  # move left
        else:
            if dy > 0:
                self.direction = 1  # move down
            else:
                self.direction = 0  # move up

# Food class
class Food:
    def __init__(self):
        self.position = (0, 0)
        self.color = WHITE
        self.randomize_position()

    def randomize_position(self):
        self.position = (random.randint(0, (WIDTH // GRID_SIZE) - 1) * GRID_SIZE,
                         random.randint(0, (HEIGHT // GRID_SIZE) - 1) * GRID_SIZE)

    def render(self, surface):
        pygame.draw.rect(surface, self.color, (self.position[0], self.position[1], GRID_SIZE, GRID_SIZE))

# Main function
def main():
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode((WIDTH, HEIGHT), 0, 32)
    surface = pygame.Surface(screen.get_size())
    surface = surface.convert()

    snake = Snake(RED)
    ai_snake = AISnake(GREEN)
    food = Food()

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        # User-controlled snake
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP]:
            snake.direction = 0
        elif keys[pygame.K_DOWN]:
            snake.direction = 1
        elif keys[pygame.K_LEFT]:
            snake.direction = 2
        elif keys[pygame.K_RIGHT]:
            snake.direction = 3

        snake.update()

        # Check for collisions
        #if snake.collide_with_self() or snake.collide_with_wall():
        #    pygame.quit()
        #    sys.exit()

        # AI-controlled snake
        ai_snake.updateFood(food.position)
        ai_snake.update()  # <-- Add this line to update the AI-controlled snake

        # Check if the snake eats the food
        if snake.get_head_position() == food.position:
            snake.grow()
            food.randomize_position()
            
        # Check if the snake eats the food
        if ai_snake.get_head_position() == food.position:
            ai_snake.grow()
            food.randomize_position()

        surface.fill(BLACK)
        snake.render(surface)
        ai_snake.render(surface)
        food.render(surface)
        screen.blit(surface, (0, 0))
        pygame.display.update()
        clock.tick(FPS)

if __name__ == "__main__":
    main()

