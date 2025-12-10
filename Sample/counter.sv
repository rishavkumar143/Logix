// Simple 8-bit counter - SystemVerilog
module counter (
    input logic clk,
    input logic reset,
    output logic [7:0] count
);

always_ff @(posedge clk or posedge reset) begin
    if (reset)
        count <= 0;
    else
        count <= count + 1;
end

endmodule
