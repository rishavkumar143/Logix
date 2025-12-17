module riscv_core_top (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [31:0] instr_in,
    input  wire [31:0] data_in,
    output wire [31:0] pc_out,
    output wire [31:0] data_out
);

    // =========================
    // Program Counter
    // =========================
    reg [31:0] pc;
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            pc <= 32'h00000000;
        else
            pc <= pc + 4;
    end
    assign pc_out = pc;

    // =========================
    // Pipeline Registers
    // =========================
    wire [31:0] if_id_instr;
    wire [31:0] id_ex_op1, id_ex_op2;
    wire [31:0] ex_mem_alu;
    wire [31:0] mem_wb_data;

    // =========================
    // Instruction Fetch
    // =========================
    if_stage IF_STAGE (
        .clk(clk),
        .instr_in(instr_in),
        .instr_out(if_id_instr)
    );

    // =========================
    // Instruction Decode
    // =========================
    id_stage ID_STAGE (
        .clk(clk),
        .instr(if_id_instr),
        .op1(id_ex_op1),
        .op2(id_ex_op2)
    );

    // =========================
    // Execute
    // =========================
    ex_stage EX_STAGE (
        .clk(clk),
        .a(id_ex_op1),
        .b(id_ex_op2),
        .y(ex_mem_alu)
    );

    // =========================
    // Memory
    // =========================
    mem_stage MEM_STAGE (
        .clk(clk),
        .alu_in(ex_mem_alu),
        .data_in(data_in),
        .data_out(mem_wb_data)
    );

    // =========================
    // Write Back
    // =========================
    wb_stage WB_STAGE (
        .clk(clk),
        .data_in(mem_wb_data),
        .data_out(data_out)
    );

    // =====================================================
    // MASSIVE INSTANCE GENERATION (512 EXECUTION TILES)
    // =====================================================
    // Purpose: Instance count stress / synthesis benchmarking
    // =====================================================

    genvar i;
    generate
        for (i = 0; i < 512; i = i + 1) begin : EXEC_TILE_ARRAY
            execution_tile TILE (
                .clk(clk),
                .rst_n(rst_n),
                .in_a(pc + i),
                .in_b(i),
                .out()
            );
        end
    endgenerate

endmodule