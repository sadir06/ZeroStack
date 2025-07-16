#include <cstdint>
#include <cstring>

// Simple memory management
void* memset(void* ptr, int value, size_t num) {
    unsigned char* p = static_cast<unsigned char*>(ptr);
    for (size_t i = 0; i < num; ++i) {
        p[i] = static_cast<unsigned char>(value);
    }
    return ptr;
}

// Simple task structure
struct Task {
    int id;
    int state;
    int a, b;  // Fibonacci state
    int counter;
};

// Global variables
Task tasks[2];
int current_task = 0;
int task_count = 2;

// Initialize tasks
void init_tasks() {
    // Task 1: Fibonacci starting with 0, 1
    tasks[0].id = 1;
    tasks[0].state = 0;
    tasks[0].a = 0;
    tasks[0].b = 1;
    tasks[0].counter = 0;
    
    // Task 2: Fibonacci starting with 1, 1
    tasks[1].id = 2;
    tasks[1].state = 0;
    tasks[1].a = 1;
    tasks[1].b = 1;
    tasks[1].counter = 0;
}

// Task 1: Compute Fibonacci numbers starting with 0, 1
void task1() {
    Task& task = tasks[0];
    
    // Simulate some work
    for (volatile int i = 0; i < 100000; ++i) {
        // Busy wait
    }
    
    // Compute next Fibonacci number
    int next = task.a + task.b;
    task.a = task.b;
    task.b = next;
    task.counter++;
    
    // Simple output simulation (in real kernel, this would go to console/serial)
    if (task.counter % 5 == 0) {
        // In a real kernel, you'd write to video memory or serial port
        // For now, we just simulate it
        volatile int* output = reinterpret_cast<volatile int*>(0xB8000);  // VGA text mode
        if (output) {
            // This is just a placeholder - real implementation would be more complex
        }
    }
}

// Task 2: Compute Fibonacci numbers starting with 1, 1
void task2() {
    Task& task = tasks[1];
    
    // Simulate some work
    for (volatile int i = 0; i < 150000; ++i) {
        // Busy wait (different amount to show different timing)
    }
    
    // Compute next Fibonacci number
    int next = task.a + task.b;
    task.a = task.b;
    task.b = next;
    task.counter++;
    
    // Simple output simulation
    if (task.counter % 3 == 0) {
        // In a real kernel, you'd write to video memory or serial port
        volatile int* output = reinterpret_cast<volatile int*>(0xB8000);
        if (output) {
            // Placeholder
        }
    }
}

// Simple round-robin scheduler
void scheduler() {
    while (true) {
        // Run current task
        if (current_task == 0) {
            task1();
        } else {
            task2();
        }
        
        // Switch to next task
        current_task = (current_task + 1) % task_count;
        
        // Simple delay to simulate time slice
        for (volatile int i = 0; i < 50000; ++i) {
            // Busy wait
        }
    }
}

// Kernel entry point
extern "C" void kernel_main() {
    // Initialize tasks
    init_tasks();
    
    // Start the scheduler
    scheduler();
} 