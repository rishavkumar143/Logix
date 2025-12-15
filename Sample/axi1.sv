// axi_lite_slave.sv


// Write response channel
output logic [1:0] BRESP,
output logic BVALID,
input logic BREADY,


// Read address channel
input logic [ADDR_WIDTH-1:0] ARADDR,
input logic ARVALID,
output logic ARREADY,


// Read data channel
output logic [DATA_WIDTH-1:0] RDATA,
output logic [1:0] RRESP,
output logic RVALID,
input logic RREADY
);


logic [DATA_WIDTH-1:0] mem [0:255];


// Write logic
always_ff @(posedge ACLK) begin
if (!ARESETn) begin
AWREADY <= 1'b0;
WREADY <= 1'b0;
BVALID <= 1'b0;
BRESP <= 2'b00;
end else begin
AWREADY <= AWVALID;
WREADY <= WVALID;


if (AWVALID && WVALID) begin
mem[AWADDR] <= WDATA;
BVALID <= 1'b1;
end


if (BVALID && BREADY)
BVALID <= 1'b0;
end
end


// Read logic
always_ff @(posedge ACLK) begin
if (!ARESETn) begin
ARREADY <= 1'b0;
RVALID <= 1'b0;
RDATA <= '0;
RRESP <= 2'b00;
end else begin
ARREADY <= ARVALID;


if (ARVALID) begin
RDATA <= mem[ARADDR];
RVALID <= 1'b1;
end


if (RVALID && RREADY)
RVALID <= 1'b0;
end
end
endmodule