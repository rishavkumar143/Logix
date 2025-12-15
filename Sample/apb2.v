## APB (AMBA) – Verilog (.v)

```verilog
// apb_slave.v
module apb_slave (
  input  wire        PCLK,
  input  wire        PRESETn,
  input  wire        PSEL,
  input  wire        PENABLE,
  input  wire        PWRITE,
  input  wire [7:0]  PADDR,
  input  wire [31:0] PWDATA,
  output reg  [31:0] PRDATA,
  output reg         PREADY
);
  reg [31:0] mem [0:255];

  always @(posedge PCLK or negedge PRESETn) begin
    if (!PRESETn) begin
      PREADY <= 1'b0;
      PRDATA <= 32'd0;
    end else begin
      PREADY <= 1'b0;
      if (PSEL && PENABLE) begin
        PREADY <= 1'b1;
        if (PWRITE) mem[PADDR] <= PWDATA;
        else PRDATA <= mem[PADDR];
      end
    end
  end
endmodule