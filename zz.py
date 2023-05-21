import serial
import matplotlib.pyplot as plt
import time
import os

arduino_port = 'COM8'
baud_rate = 9600

try:
    arduino = serial.Serial(arduino_port, baud_rate)
    print(f"Connected to Arduino on port {arduino_port}")
except serial.SerialException:
    print(f"Failed to connect to Arduino on port {arduino_port}")
    exit()

time_data = []
ecg_data = []

try:
    start_time = time.time()  # Get start time
    while True:
        data = arduino.readline().decode().strip()
        if data:
            # Convert the received data to float
            ecg = float(data)

            # Add current time
            current_time = time.time()  # Get current time
            time_data.append(current_time - start_time)  # Use relative time

            ecg_data.append(ecg)

            if len(ecg_data)>200:
                print("Data Collected")
                break

except KeyboardInterrupt:
    pass

arduino.close()

print(ecg_data)
print(time_data)

# Create a figure and axes
fig, ax = plt.subplots()
# Plot the x and y axes
ax.plot(time_data, ecg_data, color='blue')
# Label the axes
ax.set_xlabel('x')
ax.set_ylabel('y')
fig.set_size_inches(15,7)
ax.grid(True, which='major', alpha=0.0000025)
# Save the plot as a PNG file
plt.savefig('my_plot.png')