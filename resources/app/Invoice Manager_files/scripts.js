
$(document).ready(function() {

	// Invoice Type
	$('#invoice_type').change(function() {
		var invoiceType = $("#invoice_type option:selected").text();
		$(".invoice_type").text(invoiceType);
	});

	// Load dataTables
	//$("#data-table").dataTable();

	// add product
	$("#action_add_product").click(function(e) {
		e.preventDefault();
	    actionAddProduct();
	});

	
	// create invoice
	$("#action_create_invoice").click(function(e) {
		e.preventDefault();
	    actionCreateInvoice();
	});

	
	
	// enable date pickers for due date and invoice date
	var dateFormat = $(this).attr('data-vat-rate');
	$('#invoice_date, #invoice_due_date').datetimepicker({
		showClose: false,
		format: dateFormat
	});

	// copy customer details to shipping
    $('input.copy-input').on("input", function () {
        $('input#' + this.id + "_ship").val($(this).val());
    });
    
    // remove product row
    $('#invoice_table').on('click', ".delete-row", function(e) {
    	e.preventDefault();
       	$(this).closest('tr').remove();
        calculateTotal();
		
    });
	
	$('#date-preview').keyup(function() {
		$('#print-pre').html($(this).val());
	});


    // add new product row on invoice
    var cloned = $('#invoice_table tr:last').clone();
    $(".add-row").click(function(e) {
        e.preventDefault();
        cloned.clone().appendTo('#invoice_table'); 
    });
    
    calculateTotal();
    
    $('#invoice_table').on('input', '.calculate', function () {
	    updateTotals(this);
	    calculateTotal();
		
	});

	$('#invoice_totals').on('input', '.calculate', function () {
	    calculateTotal();
		
	});

	$('#invoice_product').on('input', '.calculate', function () {
	    calculateTotal();
		
	});

	$('.remove_vat').on('change', function() {
        calculateTotal();
		
    });

	function updateTotals(elem) {

        var tr = $(elem).closest('tr'),
            quantity = $('[name="invoice_product_qty[]"]', tr).val(),
	        price = $('[name="invoice_product_price[]"]', tr).val(),
            isPercent = $('[name="invoice_product_discount[]"]', tr).val().indexOf('%') > -1,
            percent = $.trim($('[name="invoice_product_discount[]"]', tr).val().replace('%', '')),
	        subtotal = parseInt(quantity) * parseFloat(price);

        if(percent && $.isNumeric(percent) && percent !== 0) {
            if(isPercent){
                subtotal = subtotal - ((parseFloat(percent) / 100) * subtotal);
            } else {
                subtotal = subtotal - parseFloat(percent);
            }
        } else {
            $('[name="invoice_product_discount[]"]', tr).val('');
        }

	    $('.calculate-sub', tr).val(subtotal.toFixed(2));
		$('[name="product-sub-place[]"]',tr).text($('.calculate-sub',tr).val());
	}

	function calculateTotal() {
	    
	    var grandTotal = 0,
	    	disc = 0,
	    	c_ship = parseInt($('.calculate.shipping').val()) || 0;

	    $('#invoice_table tbody tr').each(function() {
            var c_sbt = $('.calculate-sub', this).val(),
                quantity = $('[name="invoice_product_qty[]"]', this).val(),
	            price = $('[name="invoice_product_price[]"]', this).val() || 0,
                subtotal = parseInt(quantity) * parseFloat(price);
            
            grandTotal += parseFloat(c_sbt);
            disc += subtotal - parseFloat(c_sbt);
			
			
			
			//Binding text to variables
			//$('[name="product-sub-place[]"]',this).text(parseFloat(subtotal.toFixed(2)));
			$('[name="product-price-place[]"]',this).text(price);
			$('[name="product-disc-place[]"]',this).text(parseFloat(disc.toFixed(2)));
			$('[name="product-name-place[]"]',this).text($('[name="invoice_product[]"]',this).val());
			$('[name="product-qty-place[]"]',this).text(quantity);
			
	    });

        
		// VAT, DISCOUNT, SHIPPING, TOTAL, SUBTOTAL:
	    var subT = parseFloat(grandTotal),
	    	finalTotal = parseFloat(grandTotal - c_ship),
	    	vat = parseInt($('.invoice-vat').attr('data-vat-rate'));

	    $('.invoice-sub-total').text(subT.toFixed(2));
	    $('#invoice_subtotal').val(subT.toFixed(2));
        $('.invoice-discount').text(disc.toFixed(2));
        $('#invoice_discount').val(disc.toFixed(2));

        if($('.invoice-vat').attr('data-enable-vat') === '1') {

	        if($('.invoice-vat').attr('data-vat-method') === '1') {
		        $('.invoice-vat').text(((vat / 100) * finalTotal).toFixed(2));
		        $('#invoice_vat').val(((vat / 100) * finalTotal).toFixed(2));
	            $('.invoice-total').text((finalTotal).toFixed(2));
	            $('#invoice_total').val((finalTotal).toFixed(2));
	        } else {
	            $('.invoice-vat').text(((vat / 100) * finalTotal).toFixed(2));
	            $('#invoice_vat').val(((vat / 100) * finalTotal).toFixed(2));
		        $('.invoice-total').text((finalTotal + ((vat / 100) * finalTotal)).toFixed(2));
		        $('#invoice_total').val((finalTotal + ((vat / 100) * finalTotal)).toFixed(2));
	        }
		} else {
			$('.invoice-total').text((finalTotal).toFixed(2));
			$('#invoice_total').val((finalTotal).toFixed(2));
		}

		// remove vat
    	if($('input.remove_vat').is(':checked')) {
	        $('.invoice-vat').text("0.00");
	        $('#invoice_vat').val("0.00");
            $('.invoice-total').text((finalTotal).toFixed(2));
            $('#invoice_total').val((finalTotal).toFixed(2));
	    }

	}
	

	
	function actionCreateInvoice(){

		var errorCounter = validateForm();

		if (errorCounter > 0) {
		    $("#response").removeClass("alert-success").addClass("alert-warning").fadeIn();
		    $("#response .message").html("<strong>Error</strong>: It appear's you have forgotten to complete something!");
		    $("html, body").animate({ scrollTop: $('#response').offset().top }, 1000);
		} else {

			var $btn = $("#action_create_invoice").button("loading");

			$(".required").parent().removeClass("has-error");
			$("#create_invoice").find(':input:disabled').removeAttr('disabled');
			
			
			$("#print-name").text($('[name="customer_name"]').val());
			
			space = " ";
			address1 = $('#customer_address_1').val();
			address1 = address1.concat(space);
			address1 = address1.concat($('#customer_address_2').val());
			address1 = address1.concat(space);
			address1 = address1.concat($('#customer_town').val());
			address1 = address1.concat(space);
			address1 = address1.concat($('#customer_county').val());
			address1 = address1.concat(space);
			address1 = address1.concat($('#customer_postcode').val()); 
			$("#print-address").text(address1);
			
			$("#print-phone").text($('[name="customer_phone"]').val());
			$("#print-email").text($('[name="customer_email"]').val());
			
			$("#print-name-ship").text($('[name="customer_name_ship"]').val());
			
			address2 = $('#customer_address_1_ship').val();
			address2 = address2.concat(space);
			address2 = address2.concat($('#customer_address_2_ship').val());
			address2 = address2.concat(space);
			address2 = address2.concat($('#customer_town_ship').val());
			address2 = address2.concat(space);
			address2 = address2.concat($('#customer_county_ship').val());
			address2 = address2.concat(space);
			address2 = address2.concat($('#customer_postcode_ship').val()); 
			$("#print-address-ship").text(address2);
			
			$("#print-invoice-status").text($("#invoice_status").val());
			
			$("#print_status").text($("#invoice_status").val());
			$("#print-invoice-date").text($('[name="invoice_date"]').val());
			$("#print-invoice-due-date").text($('[name="invoice_due_date"]').val());
			
			$("#product-advance").text($('[name="invoice_shipping"]').val());
			
			
			if ($('[name="invoice_notes"]').val().trim().length == 0)
				$('[name="invoice_notes"]').hide();
			else
				$('[name="invoice_notes"]').val(
				function(i,val){
					return 'Notes:  ' + val;
			});
			
			$(".print-preview").show();
			$(".print-pre").show();
			$(".input-group-addon").hide();
			$(".form-control").hide();
			$(".btn").hide();
			$("#response").hide();
			$(".glyphicon").hide();
			
			//Print the Page
			window.print();
			location.reload();
		}

	}

   	
   	function validateForm() {
	    // error handling
	    var errorCounter = 0;

	    $(".required").each(function(i, obj) {

	        if($(this).val() === ''){
	            $(this).parent().addClass("has-error");
	            errorCounter++;
	        } else{ 
	            $(this).parent().removeClass("has-error"); 
	        }


	    });

	    return errorCounter;
	}

});