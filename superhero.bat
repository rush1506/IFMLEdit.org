if exist node_modules\almost-joint (rmdir /s /q node_modules\almost-joint) 
if exist ..\almostjs-joint (cd ..\almostjs-joint && gulp && cd ..\IFMLEdit.org) else (echo "Cannot find local package almostjs-joint") 