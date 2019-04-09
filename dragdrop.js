function ClassInformation(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
}

function Item(id, class_name, type) {
    this.id = id;
    this.class_name = class_name;
    this.type = type;
};

var mouse_X, mouse_Y;

var classes = {
    "dense": new ClassInformation("dense", "Dense", "layer"),
};
var layer_items = [];
var next_id_number = 0;

function handle_mousemove(id) {
    div = $("#"+String(id));
    div.css({position: "absolute"});
    return function(e) {
        div.css({
            left: e.pageX-div.outerWidth()/2,
            top: e.pageY-div.outerHeight()/2
        });
    };
}

function add_element(id, x, y, element_type) {
    layer_items.push(Item(element_type, classes[element_type].id, classes[element_type].type));
    clone_to($("#"+id+"-moving"), id, $("#canvas"))
    var element = $("#"+id);
    element.css({
        position: "relative",
        left: x,
        top: y
    });
    element.on("click", function() {
        clone_to($("#"+id), id+"-moving", $("#mouse-follower"));
        cancel_element(id);
        $(document).on('mousemove', handle_mousemove(id+"-moving"));
        $("#"+id+"-moving").on('mousedown', handle_mousedown(id, element_type));
    });
}

function cancel_element(id) {
    $("#"+String(id)).remove();
}

function handle_mousedown(id, element_type) {
    var div = $("#"+id + "-moving");
    var canvas_div = $('#canvas');
    return function(e) {
        // first detect where it is
        var relative_x = e.pageX-div.outerWidth()/2 - canvas_div.offset().left;
        var relative_y = e.pageY-div.outerHeight()/2 - canvas_div.offset().top;
        if ((relative_x >= 0 && relative_x <= canvas_div.width()) && (relative_y >= 0 && relative_y <= canvas_div.height())) {
            // if inside canvas
            add_element(id, relative_x, relative_y, element_type);
            $("#"+id).off("mousemove", handle_mousedown(id, element_type));
        }
        cancel_element(id+"-moving");
    }
}

function clone_to(clone_from, new_id, clone_to) {
    clone_from.clone().appendTo(clone_to).prop("id", new_id);
    var element = $("#"+new_id);
    element.css({
        position: "absolute",
        left: mouse_X - element.outerWidth()/2,
        top: mouse_Y - element.outerHeight()/2
    });
}

function add_box_listeners() {
    $(".click-create").each(function() {
        var id = this.id;
        this.onclick = function(e) {
            var new_id = String(classes[id].id)+String(next_id_number);
            next_id_number += 1;

            clone_to($(this), new_id + "-moving", $("#mouse-follower"));
            $(document).on('mousemove', handle_mousemove(new_id + "-moving"));
            $("#"+new_id+"-moving").on('mousedown', handle_mousedown(new_id, id));
        };
    })
}

function update_mouse_vars(e) {
    mouse_X = e.pageX;
    mouse_Y = e.pageY;
}

$(document).ready(function() {
    add_box_listeners()
    $(document).on('mousemove', update_mouse_vars);
})