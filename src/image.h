#ifndef IMAGE_H
#define IMAGE_H

#include "stdio.h"
#include <string>
struct ImageData {
  std::string belongs_to;
  std::string path_name;
};

void render_image(int a);

//  /image?=user-lakjsdfasdf/img-mas;dlfjasf.png

#endif // IMAGE_H
