// traffic_light.sv
module traffic_light (
    input  logic clk,
    input  logic reset,
    output logic [1:0] light   // 00=Red, 01=Yellow, 10=Green
);

    typedef enum logic [1:0] {
        RED    = 2'b00,
        YELLOW = 2'b01,
        GREEN  = 2'b10
    } state_t;

    state_t state, next_state;

    // State transition
    always_ff @(posedge clk or posedge reset) begin
        if (reset)
            state <= RED;
        else
            state <= next_state;
    end

    // Next state logic
    always_comb begin
        case (state)
            RED:    next_state = GREEN;
            GREEN:  next_state = YELLOW;
            YELLOW: next_state = RED;
            default: next_state = RED;
        endcase
    end

    assign light = state;

endmodule
