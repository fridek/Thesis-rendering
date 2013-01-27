#include <iostream>
#include <vector>

#include <glut.h>

void changeSize(int w, int h) {
	glViewport(0,0,w,h);
}

void animate() {

}

int main(int argc, char* argv[]) {
  std::cout << "Hello le World" << std::endl;

  glutInit(&argc, argv);
  glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH | GLUT_STENCIL);
  glutInitWindowSize(800,600);
  glutCreateWindow("Triangle");

  glutReshapeFunc(changeSize);
  glutDisplayFunc(animate);
  glutIdleFunc(animate);

  glutMainLoop();

  return 0;
}