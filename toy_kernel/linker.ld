/* Linker script for toy kernel */

/* Entry point */
ENTRY(kernel_main)

/* Memory layout */
SECTIONS
{
    /* Start at 1MB (typical for x86_64 kernels) */
    . = 1M;

    /* Text section (code) */
    .text : {
        *(.text)
        *(.text*)
    }

    /* Read-only data */
    .rodata : {
        *(.rodata)
        *(.rodata*)
    }

    /* Data section (initialized variables) */
    .data : {
        *(.data)
        *(.data*)
    }

    /* BSS section (uninitialized variables) */
    .bss : {
        *(.bss)
        *(.bss*)
        *(COMMON)
    }

    /* Discard other sections */
    /DISCARD/ : {
        *(.comment)
        *(.gnu*)
        *(.note*)
        *(.eh_frame*)
    }
} 