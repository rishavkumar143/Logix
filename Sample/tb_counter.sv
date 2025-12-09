// tb_counter.sv
module tb_counter;

    logic clk = 0;
    logic reset;
    logic [7:0] count;

    // Clock generation
    always #5 clk = ~clk;

    counter #(.WIDTH(8)) uut (
        .clk(clk),
        .reset(reset),
        .count(count)
    );

    initial begin
        reset = 1;
        #20;
        reset = 0;

        // Run for 200 time units
        #200;
        $finish;
    end

endmodule
