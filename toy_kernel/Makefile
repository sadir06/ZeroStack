# Cross-compiler for x86_64
CC = x86_64-elf-g++
LD = x86_64-elf-ld
AS = x86_64-elf-as

# Compiler flags
CFLAGS = -ffreestanding -fno-builtin -fno-stack-protector -nostdlib -nostdinc -fno-pie -no-pie
LDFLAGS = -T linker.ld -nostdlib

# Source files
SOURCES = kernel.cpp
OBJECTS = $(SOURCES:.cpp=.o)

# Target
TARGET = kernel.bin

# Default target
all: $(TARGET)

# Compile C++ source to object files
%.o: %.cpp
	$(CC) $(CFLAGS) -c $< -o $@

# Link object files into kernel binary
$(TARGET): $(OBJECTS)
	$(LD) $(LDFLAGS) -o $@ $^

# Create ISO for QEMU testing
iso: $(TARGET)
	mkdir -p iso/boot/grub
	cp $(TARGET) iso/boot/
	cp boot/grub.cfg iso/boot/grub/
	grub-mkrescue -o kernel.iso iso/

# Run in QEMU
run: $(TARGET)
	qemu-system-x86_64 -kernel $(TARGET) -serial stdio

# Run with ISO (if you have GRUB tools installed)
run-iso: iso
	qemu-system-x86_64 -cdrom kernel.iso -serial stdio

# Clean build artifacts
clean:
	rm -f *.o $(TARGET) kernel.iso
	rm -rf iso/

# Install dependencies (Ubuntu/Debian)
install-deps:
	sudo apt-get update
	sudo apt-get install -y gcc-multilib g++-multilib qemu-system-x86 grub-pc-bin xorriso

# Install dependencies (macOS with Homebrew)
install-deps-mac:
	brew install x86_64-elf-gcc qemu

.PHONY: all clean run run-iso install-deps install-deps-mac iso 