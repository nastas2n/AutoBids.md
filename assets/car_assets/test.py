# #for data collection
# import pyautogui
# import time
# # x, y = pyautogui.position()
# # print(f"Current mouse position: {x}, {y}")
# a = 83
# for i in range(a):
#         #righ click center
#         pyautogui.rightClick(899, 615)
#         time.sleep(0.3)
#        # press save as button
#         pyautogui.click(996, 189)
#         # # Press Enter
#         # pyautogui.press('enter')
#         time.sleep(1)
#         # Press save button
#         pyautogui.click(975, 506)
#         time.sleep(0.2)
#         # Press arrow
#         pyautogui.click(1798, 592)
#         time.sleep(0.2)

# #for mouse coordinates
# import tkinter as tk
# import pyautogui

# def update_coordinates():
#     x, y = pyautogui.position()
#     coordinates_var.set(f"X: {x}, Y: {y}")
#     root.after(100, update_coordinates)  # Update the coordinates every 100 milliseconds

# # main window
# root = tk.Tk()
# root.title("Live Mouse")
# # coordinates
# coordinates_var = tk.StringVar()
# # show the coordinates
# coordinates_label = tk.Label(root, textvariable=coordinates_var, font=("Helvetica", 16))
# coordinates_label.pack(pady=20)
# # Start 
# update_coordinates()
# # Start the GUI event loop
# root.mainloop()

# for photo list


import os
import re

def list_photos_in_folder(folder_path):

    pattern = re.compile(r"^(\d+)\..*$")
    
    matched_files = []
    
    for file in os.listdir(folder_path):

        match = pattern.match(file)
        if match:

            matched_files.append(f"../assets/car_assets/{file}")
    

    matched_files.sort(key=lambda x: int(pattern.match(os.path.basename(x)).group(1)))
    
    return matched_files



folder_path = 'assets\car_assets\Volvo XC70 3.2 AWD 2015'  
photos_list = list_photos_in_folder(folder_path)

for i in photos_list: 
    if i == photos_list[-1]:
        print('"', i, '"')
        break
    print('"', i, '",')
