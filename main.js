
let maze = document.getElementById("maze");
let ctx = maze.getContext("2d");
  
let current;  //starting cell of the maze.
let solution=[];   //the solution of the maze.
let goal;  //the last cell of the maze .

class Maze {
    
    constructor(size,rows,columns){
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid= [];
        this.stack = [];  //the backtracking stack of the maze.
        this.initializeGrid();
        this.draw_complete=false;  //used to check if the drawing of the maze is complete.
    }
    
    initializeGrid(){   
        for(let i=0 ; i<this.rows ; i++){
            let row = [];
            for(let j=0; j<this.columns ; j++){
                let cell = new Cell(i,j,this);
                row.push(cell);
            }
            this.grid.push(row);
        }
        
        current = this.grid[0][0];
        goal= this.grid[this.rows-1][this.columns-1];
        
    }
    
    drawMaze() {
        
        
        
        current.visited=true;
        let next = current.getNeighbour();  //get the next unvisited neighbour of the current cell.
        
     
          
        if(next){    //neighbour found
             
              next.visited=true;
              
              current.removeWalls(current,next); //removes the walls between the current cell and its neighbour.
              this.stack.push(current);
              
              if(current==goal){
                solution=[...this.stack]   //if the current cell is the goal we save the current stack containing the path from the start to goal.
            }
              
              current=next;
        }
        else if(this.stack.length > 0){  //no neighbours found
            if(current==goal){
                solution=[...this.stack]
            }
          current=this.stack.pop();
              
        }
          
        if (this.stack.length == 0){  //every cell is visited and the maze generation is complete.
            
            
            maze.width = this.size;
            maze.height = this.size;
            maze.style.background="black";
            
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                  
                  this.grid[i][j].drawCell();
                  
                }
              }
              this.draw_complete=true;
              current.highlight();
              this.highlightGoal();
               return;    
          }
        
          
            this.drawMaze();   //recursively call the function until every cell is visited and the backtrack stack becomes empty.
    
    }
    
    highlightGoal(){ //colors the last cell of the maze green.
      ctx.fillStyle = "rgba(0, 255, 81, 0.82)";
      ctx.fillRect((this.columns-1)*this.size/this.columns,(this.rows-1)*this.size/this.rows,this.size/this.columns,this.size/this.rows);
    }
    
    solve(){  //automatically solves the maze by drawing a path from start to goal.
        
        if(!this.draw_complete) return ;
        
        let i=0;
        
        setInterval(function() {
            
            if(i>=solution.length) {
                displaySolvedMsg();
                return;   
            }
            
            current=solution[i]; 
            current.highlight();
            i++;
           
          }, 50);
       
    }
    
}



class Cell{
    
    constructor(row_num,col_num,parent_maze){
        this.row_num = row_num;
        this.col_num = col_num;
        this.parent_maze = parent_maze;
        this.visited = false;
        this.walls = {  //each cell starts with all of the four walls being true.
            top_wall : true,
            bottom_wall : true,
            right_wall : true,
            left_wall : true
        };
        this.x = (this.col_num * parent_maze.size) / parent_maze.columns;  //x-coordinate of the cell.
        this.y = (this.row_num * parent_maze.size) / parent_maze.rows;  //y-coordinate of the cell.
        
        this.x_unit= parent_maze.size/parent_maze.columns;  //distance between a cell's x and its horizontal neighbour's x-coordinate.
        this.y_unit= parent_maze.size/parent_maze.rows;     //distance between a cell's y and its vertical neighbour's y-coordinate.
     }
     
     //draw each wall of the cell.
     
     drawTopWall(){
         ctx.beginPath();
         ctx.moveTo(this.x,this.y);
         ctx.lineTo(this.x + this.x_unit, this.y );
         ctx.stroke();
     }
     drawBottomWall(){
         ctx.beginPath();
         ctx.moveTo(this.x, this.y + this.y_unit );
         ctx.lineTo(this.x + this.x_unit , this.y + this.y_unit);
         ctx.stroke();
     }
     drawRightWall(){
         ctx.beginPath();
         ctx.moveTo(this.x + this.x_unit,this.y);
         ctx.lineTo(this.x + this.x_unit, this.y + this.y_unit);
         ctx.stroke();
     }
     drawLeftWall(){
         ctx.beginPath();
         ctx.moveTo(this.x,this.y);
         ctx.lineTo(this.x,this.y + this.y_unit );
         ctx.stroke();
     }
     
     //draw the cell by drawing the walls that are not removed.
     drawCell(){
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;
        
        if(this.walls.top_wall) this.drawTopWall();
        if(this.walls.bottom_wall) this.drawBottomWall();
        if(this.walls.right_wall) this.drawRightWall();
        if(this.walls.left_wall) this.drawLeftWall();
        
    
        
     }
     
     
     
     
     
     getNeighbour(){
         let neighbours = [];
         
         if( this.row_num != 0){
             let top = this.parent_maze.grid[this.row_num-1][this.col_num];
             if(!top.visited){
                neighbours.push(top);
             } 
         }
         
         if( this.row_num != this.parent_maze.rows-1){
            let bottom = this.parent_maze.grid[this.row_num+1][this.col_num];
            if(!bottom.visited){
               neighbours.push(bottom);
            } 
        }
        
        if( this.col_num != 0){
            let left = this.parent_maze.grid[this.row_num][this.col_num-1];
            if(!left.visited){
               neighbours.push(left);
            } 
        }
        
        if( this.col_num != this.parent_maze.columns-1){
            let right = this.parent_maze.grid[this.row_num][this.col_num+1];
            if(!right.visited){
               neighbours.push(right);
            } 
        }
        
        
        if (neighbours.length !== 0) {
            let random = Math.floor(Math.random() * neighbours.length);
            return neighbours[random];
          } else {
            return undefined;
          }
         
         
         
        
     }
     
     removeWalls(cell1,cell2){
        let x = cell1.col_num - cell2.col_num;
        
        if (x === 1) {
          cell1.walls.left_wall = false;
          cell2.walls.right_wall = false;
        } else if (x === -1) {
          cell1.walls.right_wall = false;
          cell2.walls.left_wall = false;
        }
        
        let y = cell1.row_num- cell2.row_num;
        
        if (y === 1) {
          cell1.walls.top_wall = false;
          cell2.walls.bottom_wall = false;
        } else if (y === -1) {
          cell1.walls.bottom_wall = false;
          cell2.walls.top_wall = false;
        }
     }
     
     highlight(){
        ctx.fillStyle = "rgba(7, 222, 237, 0.58)";
        ctx.fillRect(this.x,this.y,this.x_unit-1,this.y_unit-1);
        
     }
    
}




//assigning the arrow keys for maze navigation.
document.addEventListener("keydown", navigateMaze);
function navigateMaze(e){
    
    if (!new_maze.draw_complete) return;
    
    let key=e.key;
    
    switch(key){
        case "ArrowUp":
            if(!current.walls.top_wall){
                current=new_maze.grid[current.row_num-1][current.col_num];
                new_maze.drawMaze();
                
                if(current==goal)
                displaySolvedMsg();
            }
            break;
            
            
        case "ArrowDown":
            if(!current.walls.bottom_wall){
                current=new_maze.grid[current.row_num+1][current.col_num];
                new_maze.drawMaze();
                
                if(current==goal)
                displaySolvedMsg();
            }
            break;
            
            
        case "ArrowRight":
            if(!current.walls.right_wall){
                current=new_maze.grid[current.row_num][current.col_num+1];
                new_maze.drawMaze();
                
                if(current==goal)
                displaySolvedMsg();
            }
            break;
            
            
        case "ArrowLeft":
            if(!current.walls.left_wall){
                current=new_maze.grid[current.row_num][current.col_num-1];
                new_maze.drawMaze();
                
                if(current==goal)
                displaySolvedMsg();
            }
            break;
            
           
    }
    
   
    
    
    
}


function displaySolvedMsg(){
    let solved_msg=document.getElementById("solved_container");
    let maze_container=document.getElementById("maze_container")
    
    solved_msg.style.display="flex";
    maze_container.style.display="none";
    
}


document.getElementById("restart_btn").addEventListener("click",()=>{
    location.reload();
})


document.getElementById("solve_btn").addEventListener("click",()=>{
    new_maze.solve();
})



let new_maze =  new Maze(500,10,10); //creates a new maze of size 400px and 10 rows and columns.
new_maze.drawMaze();
