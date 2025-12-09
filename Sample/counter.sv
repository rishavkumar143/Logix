// counter.sv
module counter #(
    parameter WIDTH = 8
)(
    input  logic clk,
    input  logic reset,
    output logic [WIDTH-1:0] count
);

    always_ff @(posedge clk or posedge reset) begin
        if (reset)
            count <= 0;
        else
            count <= count + 1;
    end
endmodule
